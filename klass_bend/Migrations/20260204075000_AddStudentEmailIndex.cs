using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace klass_bend.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentEmailIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "Index_StudentEmail",
                table: "JitsiSessions",
                column: "UserEmail");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "Index_StudentEmail",
                table: "JitsiSessions");
        }
    }
}
