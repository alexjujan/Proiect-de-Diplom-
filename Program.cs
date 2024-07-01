using airq_webapp;
using Microsoft.AspNetCore.Builder.Extensions;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddMemoryCache();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowCORS", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

FirebaseApp.Create(new AppOptions()
{
    Credential = GoogleCredential.FromFile(builder.Configuration["Firebase:ServiceAccountKeyPath"])
});

builder.Services.AddSingleton<FcmService>();
builder.Services.AddSingleton<NotificationService>();

var app = builder.Build();

app.UseCors("AllowCORS");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
