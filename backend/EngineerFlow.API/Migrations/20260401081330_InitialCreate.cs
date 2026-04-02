using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EngineerFlow.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "JobRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    RequesterName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    AssignedTo = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Priority = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    Category = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DueDate = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobRequests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CompletionEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    JobRequestId = table.Column<int>(type: "INTEGER", nullable: false),
                    CompletedBy = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    DurationMinutes = table.Column<int>(type: "INTEGER", nullable: true),
                    ResolutionSummary = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompletionEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompletionEvents_JobRequests_JobRequestId",
                        column: x => x.JobRequestId,
                        principalTable: "JobRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "JobRequests",
                columns: new[] { "Id", "AssignedTo", "Category", "CreatedAt", "Description", "DueDate", "Priority", "RequesterName", "Status", "Title", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Bob Smith", "DevOps", new DateTime(2024, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "The main branch pipeline has been failing since the last merge. Investigate and resolve.", null, 3, "Alice Chen", 1, "Fix CI/CD pipeline failure", new DateTime(2024, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, null, "Backend", new DateTime(2024, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Add rate limiting middleware to the public API endpoints to prevent abuse.", null, 2, "Carlos Rivera", 0, "API rate limiting implementation", new DateTime(2024, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, "Eve Johnson", "Database", new DateTime(2024, 12, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Slow queries on the reports page — profile and add appropriate indexes.", null, 1, "Dana Patel", 0, "Database index optimisation", new DateTime(2024, 12, 30, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompletionEvents_JobRequestId",
                table: "CompletionEvents",
                column: "JobRequestId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompletionEvents");

            migrationBuilder.DropTable(
                name: "JobRequests");
        }
    }
}
