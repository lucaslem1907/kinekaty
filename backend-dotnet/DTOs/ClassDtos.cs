namespace KinekatyApi.DTOs;

public record CreateClassRequest(
    string Title,
    string? Description,
    DateTime Date,
    string Time,
    int Duration,
    string Location,
    int Capacity
);

public record UpdateClassRequest(
    string? Title,
    string? Description,
    DateTime? Date,
    string? Time,
    int? Duration,
    string? Location,
    int? Capacity
);

public record ClassDto(
    int Id,
    string Title,
    string? Description,
    DateTime Date,
    string Time,
    int Duration,
    string Location,
    int Capacity,
    int BookingsCount,
    DateTime CreatedAt
);
