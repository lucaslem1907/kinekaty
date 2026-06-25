using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KinekatyApi.Migrations
{
    /// <inheritdoc />
    public partial class AddTokenCostToClass : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TokenCost",
                table: "Classes",
                type: "integer",
                nullable: false,
                defaultValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TokenCost",
                table: "Classes");
        }
    }
}
