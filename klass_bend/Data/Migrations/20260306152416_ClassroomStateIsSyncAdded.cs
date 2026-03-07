using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace klass_bend.Data.Migrations
{
    /// <inheritdoc />
    public partial class ClassroomStateIsSyncAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSynced",
                table: "ClassroomState",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "ClassroomState",
                keyColumn: "Id",
                keyValue: 1,
                column: "IsSynced",
                value: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSynced",
                table: "ClassroomState");
        }
    }
}
