using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EngineerFlow.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditTrail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditTrailEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    EntityType = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    EntityId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Action = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Details = table.Column<string>(type: "TEXT", nullable: false),
                    User = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    IpAddress = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    EntityTitle = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditTrailEntries", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditTrailEntries_Action",
                table: "AuditTrailEntries",
                column: "Action");

            migrationBuilder.CreateIndex(
                name: "IX_AuditTrailEntries_EntityType",
                table: "AuditTrailEntries",
                column: "EntityType");

            migrationBuilder.CreateIndex(
                name: "IX_AuditTrailEntries_Timestamp",
                table: "AuditTrailEntries",
                column: "Timestamp");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditTrailEntries");
        }
    }
}
