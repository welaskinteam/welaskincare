const API_URL = "http://127.0.0.1:8000";


export async function analyzeSkin({
    image,
}) {
    const data = new FormData();

    // ส่งรูปไป Backend AI ของเรา
    data.append("file", image);

    const response = await fetch(
        `${API_URL}/api/skin/analyze`,
        {
            method: "POST",
            body: data,
        }
    );

    if (!response.ok) {
        const error = await response.text();

        throw new Error(
            `Skin analysis failed: ${error}`
        );
    }

    return response.json();
}