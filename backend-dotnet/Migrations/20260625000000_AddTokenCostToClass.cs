using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KinekatyApi.Migrations
{
    public partial class AddTokenCostToClass : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TokenCost",
                table: "Classes",
                type: "integer",
                nullable: false,
                defaultValue: 1);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TokenCost",
                table: "Classes");
        }
    }
}
