using System.Text;
using System.Text.Json;

namespace KinekatyApi.Services;

public class ResendEmailService(IConfiguration config, ILogger<ResendEmailService> logger) : IEmailService
{
    public async Task SendWelcomeEmailAsync(string toEmail, string toName)
    {
        var apiKey  = config["Resend__ApiKey"] ?? config["Resend:ApiKey"];
        var from    = config["Resend__From"]   ?? config["Resend:From"] ?? "onboarding@resend.dev";
        var appName = config["Resend__AppName"] ?? config["Resend:AppName"] ?? "Kinekaty";

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            logger.LogWarning("Resend API key not configured — skipping welcome email for {Email}", toEmail);
            return;
        }

        var html = $"""
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f7fafc;border-radius:12px;">
              <div style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:10px;padding:28px 24px;text-align:center;margin-bottom:24px;">
                <h1 style="color:#fff;margin:0;font-size:26px;">Welkom bij {appName}!</h1>
              </div>
              <p style="font-size:15px;color:#2d3748;">Hallo <strong>{toName}</strong>,</p>
              <p style="font-size:15px;color:#4a5568;line-height:1.6;">
                Je account is succesvol aangemaakt. Je kan nu inloggen en lessen boeken.
              </p>
              <p style="font-size:13px;color:#718096;margin-top:32px;">
                Heb je vragen? Stuur ons gerust een berichtje.
              </p>
              <p style="font-size:13px;color:#a0aec0;margin-top:8px;">
                &mdash; Het {appName} team
              </p>
            </div>
            """;

        var payload = new
        {
            from    = $"{appName} <{from}>",
            to      = new[] { toEmail },
            subject = $"Welkom bij {appName}!",
            html
        };

        try
        {
            using var http = new HttpClient();
            http.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

            var json    = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await http.PostAsync("https://api.resend.com/emails", content);
            var body     = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
                logger.LogInformation("Welcome email sent to {Email} via Resend", toEmail);
            else
                logger.LogError("Resend returned {Status}: {Body}", (int)response.StatusCode, body);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send welcome email to {Email}", toEmail);
        }
    }
}
