using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EngineerFlow.API.Migrations
{
    /// <inheritdoc />
    public partial class ModelUpdate_Final : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "JobRequests",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "JobRequests",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "JobRequests",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.AddColumn<int>(
                name: "AssignedUserId",
                table: "JobRequests",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ActivityLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    JobRequestId = table.Column<int>(type: "INTEGER", nullable: true),
                    Action = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Details = table.Column<string>(type: "TEXT", nullable: false),
                    User = table.Column<string>(type: "TEXT", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivityLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActivityLogs_JobRequests_JobRequestId",
                        column: x => x.JobRequestId,
                        principalTable: "JobRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Attachments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    JobRequestId = table.Column<int>(type: "INTEGER", nullable: false),
                    FileName = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    FilePath = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    ContentType = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    FileSize = table.Column<long>(type: "INTEGER", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Attachments_JobRequests_JobRequestId",
                        column: x => x.JobRequestId,
                        principalTable: "JobRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Username = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<int>(type: "INTEGER", nullable: false),
                    FullName = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_JobRequests_AssignedUserId",
                table: "JobRequests",
                column: "AssignedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityLogs_JobRequestId",
                table: "ActivityLogs",
                column: "JobRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_JobRequestId",
                table: "Attachments",
                column: "JobRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_JobRequests_Users_AssignedUserId",
                table: "JobRequests",
                column: "AssignedUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobRequests_Users_AssignedUserId",
                table: "JobRequests");

            migrationBuilder.DropTable(
                name: "ActivityLogs");

            migrationBuilder.DropTable(
                name: "Attachments");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropIndex(
                name: "IX_JobRequests_AssignedUserId",
                table: "JobRequests");

            migrationBuilder.DropColumn(
                name: "AssignedUserId",
                table: "JobRequests");

            migrationBuilder.InsertData(
                table: "JobRequests",
                columns: new[] { "Id", "AssignedTo", "Category", "CreatedAt", "Description", "DueDate", "Priority", "RequesterName", "Status", "Title", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Bob Smith", "DevOps", new DateTime(2024, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "The main branch pipeline has been failing since the last merge. Investigate and resolve.", null, 3, "Alice Chen", 1, "Fix CI/CD pipeline failure", new DateTime(2024, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, null, "Backend", new DateTime(2024, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Add rate limiting middleware to the public API endpoints to prevent abuse.", null, 2, "Carlos Rivera", 0, "API rate limiting implementation", new DateTime(2024, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, "Eve Johnson", "Database", new DateTime(2024, 12, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Slow queries on the reports page — profile and add appropriate indexes.", null, 1, "Dana Patel", 0, "Database index optimisation", new DateTime(2024, 12, 30, 0, 0, 0, 0, DateTimeKind.Utc) }
                });
        }
    }
}
