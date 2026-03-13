using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace klass_bend.Data.Migrations
{
    /// <inheritdoc />
    public partial class JitsiSessionsDisplayName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DisplayName",
                table: "JitsiSessions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 1,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 2,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 3,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 4,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 5,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 6,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 7,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 8,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 9,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 10,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 11,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 12,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 13,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 14,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 15,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 16,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 17,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 18,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 19,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 20,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 21,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 22,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 23,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 24,
                column: "DisplayName",
                value: null);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 25,
                column: "DisplayName",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DisplayName",
                table: "JitsiSessions");
        }
    }
}
