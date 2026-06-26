namespace KinekatyApi.Services;

public interface IEmailService
{
    Task SendWelcomeEmailAsync(string toEmail, string toName);
}
