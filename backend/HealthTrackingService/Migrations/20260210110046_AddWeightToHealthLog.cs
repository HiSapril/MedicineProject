using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthTrackingService.Migrations
{
    /// <inheritdoc />
    public partial class AddWeightToHealthLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Weight",
                table: "HealthLogs",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Weight",
                table: "HealthLogs");
        }
    }
}
