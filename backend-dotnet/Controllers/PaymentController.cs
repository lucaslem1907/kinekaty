using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KinekatyApi.Controllers;

[ApiController]
[Route("api/payment")]
public class PaymentController : ControllerBase
{
    // POST /api/payment/createsession
    [HttpPost("createsession")]
    [Authorize]
    public IActionResult CreateSession()
    {
        // TODO: integrate with Stripe
        return Ok(new { message = "Payment session stub — not yet implemented" });
    }
}
