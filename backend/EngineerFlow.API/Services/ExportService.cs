using EngineerFlow.API.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ClosedXML.Excel;

namespace EngineerFlow.API.Services;

public interface IExportService
{
    byte[] GeneratePdfReport(List<JobRequest> jobs);
    byte[] GenerateExcelReport(List<JobRequest> jobs);
}

public class ExportService : IExportService
{
    public byte[] GeneratePdfReport(List<JobRequest> jobs)
    {
        QuestPDF.Settings.License = LicenseType.Community;
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(12));

                page.Header().Text("EngineerFlow Job Requests Report").FontSize(20).SemiBold().FontColor(Colors.Blue.Medium);

                page.Content().PaddingVertical(1, Unit.Centimetre).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn();
                        columns.RelativeColumn(3);
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                    });

                    table.Header(header =>
                    {
                        header.Cell().Element(CellStyle).Text("ID");
                        header.Cell().Element(CellStyle).Text("Title");
                        header.Cell().Element(CellStyle).Text("Priority");
                        header.Cell().Element(CellStyle).Text("Status");

                        static IContainer CellStyle(IContainer container) => container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                    });

                    foreach (var job in jobs)
                    {
                        table.Cell().Element(CellStyle).Text(job.Id.ToString());
                        table.Cell().Element(CellStyle).Text(job.Title);
                        table.Cell().Element(CellStyle).Text(job.Priority.ToString());
                        table.Cell().Element(CellStyle).Text(job.Status.ToString());

                        static IContainer CellStyle(IContainer container) => container.PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten2);
                    }
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                });
            });
        });

        return document.GeneratePdf();
    }

    public byte[] GenerateExcelReport(List<JobRequest> jobs)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Job Requests");
        worksheet.Cell(1, 1).Value = "ID";
        worksheet.Cell(1, 2).Value = "Title";
        worksheet.Cell(1, 3).Value = "Description";
        worksheet.Cell(1, 4).Value = "Priority";
        worksheet.Cell(1, 5).Value = "Status";
        worksheet.Cell(1, 6).Value = "Category";
        worksheet.Cell(1, 7).Value = "Created At";

        for (int i = 0; i < jobs.Count; i++)
        {
            var job = jobs[i];
            worksheet.Cell(i + 2, 1).Value = job.Id;
            worksheet.Cell(i + 2, 2).Value = job.Title;
            worksheet.Cell(i + 2, 3).Value = job.Description;
            worksheet.Cell(i + 2, 4).Value = job.Priority.ToString();
            worksheet.Cell(i + 2, 5).Value = job.Status.ToString();
            worksheet.Cell(i + 2, 6).Value = job.Category;
            worksheet.Cell(i + 2, 7).Value = job.CreatedAt;
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
