using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace klass_bend.Migrations
{
    /// <inheritdoc />
    public partial class AddJitsiSessionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "JitsiSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    JitsiUserStaticId = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    UserEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    IsOccupied = table.Column<bool>(type: "bit", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JitsiSessions", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "JitsiSessions",
                columns: new[] { "Id", "IsOccupied", "JitsiUserStaticId", "JoinedAt", "UserEmail" },
                values: new object[,]
                {
                    { 1, false, "student001", null, null },
                    { 2, false, "student002", null, null },
                    { 3, false, "student003", null, null },
                    { 4, false, "student004", null, null },
                    { 5, false, "student005", null, null },
                    { 6, false, "student006", null, null },
                    { 7, false, "student007", null, null },
                    { 8, false, "student008", null, null },
                    { 9, false, "student009", null, null },
                    { 10, false, "student010", null, null },
                    { 11, false, "student011", null, null },
                    { 12, false, "student012", null, null },
                    { 13, false, "student013", null, null },
                    { 14, false, "student014", null, null },
                    { 15, false, "student015", null, null },
                    { 16, false, "student016", null, null },
                    { 17, false, "student017", null, null },
                    { 18, false, "student018", null, null },
                    { 19, false, "student019", null, null },
                    { 20, false, "student020", null, null },
                    { 21, false, "student021", null, null },
                    { 22, false, "student022", null, null },
                    { 23, false, "student023", null, null },
                    { 24, false, "student024", null, null },
                    { 25, false, "student025", null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JitsiSessions");
        }
    }
}
