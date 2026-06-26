using System.Text;
using KinekatyApi.Data;
using KinekatyApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

// Npgsql: accept DateTime with Kind=Unspecified as UTC (avoids "timestamp with time zone" errors)
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// -- Database (Supabase / PostgreSQL) --
var csb = new Npgsql.NpgsqlConnectionStringBuilder
{
    Host     = builder.Configuration["DB_HOST"]     ?? throw new InvalidOperationException("DB_HOST not configured"),
    Port     = int.Parse(builder.Configuration["DB_PORT"] ?? "5432"),
    Database = builder.Configuration["DB_NAME"]     ?? "postgres",
    Username = builder.Configuration["DB_USER"]     ?? "postgres",
    Password = builder.Configuration["DB_PASSWORD"] ?? throw new InvalidOperationException("DB_PASSWORD not configured"),
    SslMode  = Npgsql.SslMode.Require
};

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(csb.ConnectionString));

// -- JWT Authentication --
var jwtKey      = builder.Configuration["Jwt:Key"]      ?? throw new InvalidOperationException("Jwt:Key not configured");
var jwtIssuer   = builder.Configuration["Jwt:Issuer"]   ?? "KinekatyApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "KinekatyApi";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtIssuer,
            ValidAudience            = jwtAudience,
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            NameClaimType            = "sub"
        };
    });

// -- Authorization --
builder.Services.AddAuthorization(options =>
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireClaim("isAdmin", "true")));

// -- CORS --
// Build allowed origins list — always include localhost for local dev
var allowedOrigins = new List<string> { "http://localhost:3000", "http://localhost:5173" };
var frontendUrl = builder.Configuration["Frontend:Url"];
if (!string.IsNullOrWhiteSpace(frontendUrl))
    allowedOrigins.Add(frontendUrl.TrimEnd('/'));

Console.WriteLine($"[CORS] Allowed origins: {string.Join(", ", allowedOrigins)}");

builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins([.. allowedOrigins])
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()));

// -- Controllers + Swagger --
builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddControllers()
    .AddJsonOptions(o =>
        o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "KinekatyApi (.NET)", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In          = ParameterLocation.Header,
        Description = "Enter: Bearer {token}",
        Name        = "Authorization",
        Type        = SecuritySchemeType.ApiKey
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// -- Migrate + seed on startup --
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
        await Seeder.SeedAsync(db);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[STARTUP] DB migration/seed failed: {ex.Message}");
    }
}

// -- Middleware pipeline --
// CORS must be first so OPTIONS preflight requests get headers before auth runs
app.UseCors("AllowFrontend");

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/api/health", () => Results.Ok(new
{
    ok          = true,
    timestamp   = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName
}));

app.Run();
