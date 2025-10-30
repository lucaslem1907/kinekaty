namespace KinekatyApi.DTOs;

public record CreateBookingRequest(int ClassId);

public record BookingDto(
    int Id,
    int UserId,
    string UserName,
    int ClassId,
    string ClassTitle,
    DateTime BookedAt
);
