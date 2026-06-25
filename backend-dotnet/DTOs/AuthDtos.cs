namespace KinekatyApi.DTOs;

public record RegisterRequest(
    string Name,
    string Email,
    string Password,
    string? Phone,
    string? Address,      // maps to User.Street (matches frontend field name)
    string? HouseNumber,  // maps to User.Number
    string? City,
    string? ZipCode,
    bool IsAdmin = false
);

public record LoginRequest(string Email, string Password, bool IsAdmin = false);

public record UpdateUserRequest(
    string? Name,
    string? Email,
    string? Phone,
    string? Street,
    int?    Number,
    string? City
);

public record AuthResponse(string Token, UserDto User);

public record UserDto(
    int Id,
    string Name,
    string Email,
    string? Phone,
    string? Street,
    int? Number,
    string? City,
    bool IsAdmin,
    DateTime CreatedAt
);
