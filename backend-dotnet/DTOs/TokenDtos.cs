namespace KinekatyApi.DTOs;

public record BuyTokensRequest(int Amount);

public record UseTokensRequest(int Amount);

public record GrantTokensRequest(int UserId, int Amount, string? Note);

public record TokenTransactionDto(
    int Id,
    int UserId,
    int Amount,
    string Type,
    DateTime CreatedAt
);
