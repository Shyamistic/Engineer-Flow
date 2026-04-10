using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EngineerFlow.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditFlagging : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FlagReason",
                table: "AuditTrailEntries",
                type: "TEXT",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsFlagged",
                table: "AuditTrailEntries",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FlagReason",
                table: "AuditTrailEntries");

            migrationBuilder.DropColumn(
                name: "IsFlagged",
                table: "AuditTrailEntries");
        }
    }
}
