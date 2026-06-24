using System.Text;
using KinekatyApi.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ── Database (Supabase / PostgreSQL) ──────────────────────────────────────────
var rawHost = builder.Configuration["DB_HOST"] ?? throw new InvalidOperationException("DB_HOST not configured");
// Strip tcp:// or any scheme prefix Render may inject
var cleanHost = rawHost.Replace("tcp://", "").Replace("http://", "").Replace("https://", "").Split(':')[0];

var csb = new Npgsql.NpgsqlConnectionStringBuilder
{
    Host     = cleanHost,
    Port     = int.Parse(builder.Configuration["DB_PORT"] ?? "5432"),
    Database = builder.Configuration["DB_NAME"]     ?? "postgres",
    Username = builder.Configuration["DB_USER"]     ?? "postgres",
    Password = builder.Configuration["DB_PASSWORD"] ?? throw new InvalidOperationException("DB_PASSWORD not configured"),
    SslMode  = Npgsql.SslMode.Require
};

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(csb.ConnectionString));

// ── JWT Authentication ────────────────────────────────────────────────────────
var jwtKey      = builder.Configuration["Jwt:Key"]      ?? throw new InvalidOperationException("Jwt:Key not configured");
var jwtIssuer   = builder.Configuration["Jwt:Issuer"]   ?? "KinekatyApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "KinekatyApi";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;   // keep 'sub' and 'isAdmin' as-is
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

// ── Authorization — AdminOnly policy ─────────────────────────────────────────
builder.Services.AddAuthorization(options =>
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireClaim("isAdmin", "true")));

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(builder.Configuration["Frontend:Url"] ?? "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()));

// ── Controllers + Swagger ─────────────────────────────────────────────────────
builder.Services.AddControllers();
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

// ── Migrate + seed on startup ─────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    await Seeder.SeedAsync(db);
}

// ── Middleware pipeline ───────────────────────────────────────────────────────
// Swagger always enabled — accessible on Render at /swagger
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();
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

