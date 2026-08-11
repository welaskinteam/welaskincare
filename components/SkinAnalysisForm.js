import { useState } from "react";
import ImageUploader from "./ImageUploader";

export default function SkinAnalysisForm() {
  const [formData, setFormData] = useState({
    image: null,
    gender: "",
    ageRange: "",
    skinType: "",
    concerns: "",
    goal: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.image) {
      setError("Please select an image.");
      return;
    }

    if (!formData.gender) {
      setError("Please select your gender.");
      return;
    }

    if (!formData.ageRange) {
      setError("Please select your age range.");
      return;
    }

    if (!formData.skinType) {
      setError("Please select your skin type.");
      return;
    }

    if (!formData.concerns.trim()) {
      setError("Please enter your skin concerns.");
      return;
    }

    if (!formData.goal) {
      setError("Please select your goal.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = new FormData();

      data.append("image", formData.image);
      data.append("gender", formData.gender);
      data.append("ageRange", formData.ageRange);
      data.append("skinType", formData.skinType);
      data.append("concerns", formData.concerns);
      data.append("goal", formData.goal);

      console.log("FormData:");

      for (const [key, value] of data.entries()) {
        console.log(key, value);
      }

      const API_URL = process.env.NEXT_PUBLIC_SKIN_AI_API_URL;

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: data,
      });

      const responseData = await response.json();

      console.log("Status:", response.status);
      console.log("API Response:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData.detail
            ? JSON.stringify(responseData.detail)
            : `API Error: ${response.status}`,
        );
      }

      setResult(responseData);
    } catch (error) {
      console.error("API Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>Skin Analysis</h1>

        <ImageUploader
          onImageChange={(file) => {
            setFormData((prev) => ({
              ...prev,
              image: file,
            }));
          }}
        />

        <br />

        {/* Gender */}
        <div>
          <label htmlFor="gender">Gender</label>
          <br />

          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>

        <br />

        {/* Goal */}
        <div>
          <label htmlFor="goal">Goal</label>
          <br />

          <select
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            required
          >
            <option value="">Select goal</option>
            <option value="acne_control">Acne Control</option>
            <option value="oil_control">Oil Control</option>
            <option value="hydration">Hydration</option>
            <option value="brightening">Brightening</option>
            <option value="anti_aging">Anti Aging</option>
            <option value="skin_health">Skin Health</option>
          </select>
        </div>

        <br />

        {/* Age Range */}
        <div>
          <label htmlFor="ageRange">Age Range</label>
          <br />

          <select
            id="ageRange"
            name="ageRange"
            value={formData.ageRange}
            onChange={handleChange}
            required
          >
            <option value="">Select age range</option>
            <option value="18-24">18-24</option>
            <option value="25-31">25-31</option>
            <option value="32-38">32-38</option>
            <option value="39-45">39-45</option>
            <option value="46+">46+</option>
          </select>
        </div>

        <br />

        {/* Skin Type */}
        <div>
          <label htmlFor="skinType">Skin Type</label>
          <br />

          <select
            id="skinType"
            name="skinType"
            value={formData.skinType}
            onChange={handleChange}
            required
          >
            <option value="">Select skin type</option>
            <option value="normal">Normal</option>
            <option value="dry">Dry</option>
            <option value="oily">Oily</option>
            <option value="combination">Combination</option>
            <option value="sensitive">Sensitive</option>
          </select>
        </div>

        <br />

        {/* Concerns */}
        <div>
          <label htmlFor="concerns">Concerns</label>
          <br />

          <input
            id="concerns"
            name="concerns"
            type="text"
            placeholder="acne,pores"
            value={formData.concerns}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        {/* Submit */}
        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Skin"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div>
          <h2>Analysis Result</h2>

          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}