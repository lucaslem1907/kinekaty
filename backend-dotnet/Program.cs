using System.Text;
using KinekatyApi.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ── Database (Supabase / PostgreSQL) ──────────────────────────────────────────
// Npgsql expects key-value format. Convert postgres:// URI automatically if needed.
var rawConn = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured");

var connectionString = rawConn.StartsWith("postgres://") || rawConn.StartsWith("postgresql://")
    ? ConvertPostgresUri(rawConn)
    : rawConn;

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

static string ConvertPostgresUri(string uri)
{
    var u        = new Uri(uri);
    var userInfo = u.UserInfo.Split(':', 2);
    var db       = u.AbsolutePath.TrimStart('/');
    return $"Host={u.Host};Port={u.Port};Database={db};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
}

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

