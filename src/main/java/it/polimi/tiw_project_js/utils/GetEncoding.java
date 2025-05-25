package it.polimi.tiw_project_js.utils;

import jakarta.servlet.ServletContext;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.util.Base64;

public class GetEncoding {

    /**
     * Static method that takes the file from local storage and encodes it into a base64 string
     *
     * @param relativeFilePath
     * @param context
     * @return
     * @throws IOException
     */
    public static String getFileEncoding(String relativeFilePath, ServletContext context) throws IOException {
        String folderPath = context.getInitParameter("musicPath");
        File file = new File(folderPath + relativeFilePath);

        if (!file.exists() || file.isDirectory()) {
            return null;
        }

        //Take the byte array of the file
        byte[] fileContent = FileUtils.readFileToByteArray(file);
        //Take the base64 string
        String encodedString = Base64.getEncoder().encodeToString(fileContent);

        //Take the right type of each file
        encodedString = "data:" + context.getMimeType(relativeFilePath) + ";base64," + encodedString;

        return encodedString;
    }
}