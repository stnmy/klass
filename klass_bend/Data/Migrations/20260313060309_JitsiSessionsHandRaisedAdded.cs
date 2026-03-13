using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace klass_bend.Data.Migrations
{
    /// <inheritdoc />
    public partial class JitsiSessionsHandRaisedAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsHandRaised",
                table: "JitsiSessions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 1,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 2,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 3,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 4,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 5,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 6,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 7,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 8,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 9,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 10,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 11,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 12,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 13,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 14,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 15,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 16,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 17,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 18,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 19,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 20,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 21,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 22,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 23,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 24,
                column: "IsHandRaised",
                value: false);

            migrationBuilder.UpdateData(
                table: "JitsiSessions",
                keyColumn: "Id",
                keyValue: 25,
                column: "IsHandRaised",
                value: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsHandRaised",
                table: "JitsiSessions");
        }
    }
}
