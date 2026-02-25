using System.Security.Claims;
using System.Text;
using klass_bend.Data;
using klass_bend.Interfaces;
using klass_bend.Models;
using klass_bend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddOpenApi();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IJwtService, JwtService>();

builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.User.RequireUniqueEmail = true;
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

var jwt = builder.Configuration.GetSection("Jwt");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var token = context.Request.Cookies["auth_token"];

            if (!string.IsNullOrEmpty(token))
            {
                context.Token = token;
            }

            return Task.CompletedTask;
        }
    };

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = jwt["Issuer"],
        ValidAudience = jwt["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwt["Key"]!)
        ),

        RoleClaimType = ClaimTypes.Role
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactDev", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("AllowReactDev");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToController("Index", "Fallback");

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var db = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<User>>();

        // 1. Ensure the database is actually there
        if (await db.Database.CanConnectAsync())
        {
            // 2. Check if the 'AspNetUsers' table has any rows
            // We use userManager.Users because it's the Identity standard
            bool hasUsers = await userManager.Users.AnyAsync();

            if (!hasUsers)
            {
                logger.LogInformation("No users found in database. Seeding initial data...");

                // If you are 100% sure your tables exist but are just empty:
                await Seed.SeedAsync(services);

                logger.LogInformation("Seeding completed successfully.");
            }
            else
            {
                logger.LogInformation("Database already contains data. Skipping seed.");
            }

            // 3. Your specific Jitsi Session logic
            var firstSession = await db.JitsiSessions
                .Where(s => s.Id == 1 && string.IsNullOrEmpty(s.UserEmail))
                .FirstOrDefaultAsync();

            if (firstSession != null)
            {
                firstSession.UserEmail = "teacher@gmail.com";
                await db.SaveChangesAsync();
            }
        }
        else
        {
            logger.LogError("Could not connect to the Azure Database. Check Firewall settings.");
        }
    }
    catch (Exception ex)
    {
        // This will catch the error if the table doesn't exist at all
        logger.LogError(ex, "An error occurred during startup data check. You may need to run 'dotnet ef database update'.");
    }
}


app.Run();
