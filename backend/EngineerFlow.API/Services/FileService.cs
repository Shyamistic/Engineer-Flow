using Microsoft.AspNetCore.Http;

namespace EngineerFlow.API.Services;

public interface IFileService
{
    Task<string> SaveFileAsync(IFormFile file, string subFolder);
    bool DeleteFile(string filePath);
}

public class FileService : IFileService
{
    private readonly IWebHostEnvironment _env;

    public FileService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> SaveFileAsync(IFormFile file, string subFolder)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty");

        var uploadPath = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", subFolder);
        if (!Directory.Exists(uploadPath))
            Directory.CreateDirectory(uploadPath);

        var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var filePath = Path.Combine(uploadPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return $"/uploads/{subFolder}/{fileName}";
    }

    public bool DeleteFile(string filePath)
    {
        var fullPath = Path.Combine(_env.WebRootPath ?? "wwwroot", filePath.TrimStart('/'));
        if (File.Exists(fullPath))
        {
            try { File.Delete(fullPath); return true; } catch { return false; }
        }
        return false;
    }
}
