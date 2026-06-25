namespace KinekatyApi.DTOs;

public record CreateClassRequest(
    string Title,
    string? Description,
    DateTime Date,
    string Time,
    int Duration,
    string Location,
    int Capacity,
    int TokenCost = 1
);

public record UpdateClassRequest(
    string? Title,
    string? Description,
    DateTime? Date,
    string? Time,
    int? Duration,
    string? Location,
    int? Capacity,
    int? TokenCost
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
    int TokenCost,
    int BookingsCount,
    DateTime CreatedAt
);
