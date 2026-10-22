
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addImages,
  removeImage,
  toggleFavorite,
} from "./features/gallery/gallerSlice";
import "./App.css";

function App() {
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const dispatch = useDispatch();

  const images = useSelector((state) => state.gallery.images);
  const hashes = useSelector((state) => state.gallery.hashes);

  async function generateHash(file) {
    const buffer = await file.arrayBuffer();

    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      buffer
    );

    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  async function handleUpload(event) {
    const files = Array.from(event.target.files);
    const knownHashes = new Set(hashes);
    const newImages = [];
    let duplicates = 0;

    setMessage("");

    for (const file of files) {
      const hash = await generateHash(file);

      if (knownHashes.has(hash)) {
        duplicates++;
        continue;
      }

      knownHashes.add(hash);

      newImages.push({
        id: hash,
        name: file.name,
        url: URL.createObjectURL(file),
        isFavorite: false,
        uploadedAt: Date.now(),
      });
    }

    if (newImages.length > 0) {
      dispatch(addImages(newImages));
    }

    if (duplicates > 0) {
      setMessage(`${duplicates} duplicate image(s) skipped.`);
    } else if (newImages.length > 0) {
      setMessage("Images uploaded successfully!");
    }

    event.target.value = "";
  }

  function handleDelete(id) {
    const image = images.find((image) => image.id === id);

    if (image) {
      URL.revokeObjectURL(image.url);
      dispatch(removeImage(id));
    }
  }

  // Feature 1: Search and favourites filter
  const filteredImages = images.filter((image) => {
    const matchesSearch = image.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFavorite =
      !showFavorites || image.isFavorite;

    return matchesSearch && matchesFavorite;
  });

  // Feature 2: Gallery statistics
  const totalImages = images.length;

  const totalFavorites = images.filter(
    (image) => image.isFavorite
  ).length;

  const visibleImages = filteredImages.length;

  // Feature 3: Sort images
  const sortedImages = [...filteredImages].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }

    if (sortBy === "oldest") {
      return a.uploadedAt - b.uploadedAt;
    }

    return b.uploadedAt - a.uploadedAt;
  });

  return (
    <div className="app">
      <h1>My Image Gallery</h1>
      <p>Upload and manage your images.</p>

      <div className="toolbar">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
        />

        <input
          type="text"
          placeholder="Search images..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <button
          onClick={() => setShowFavorites(!showFavorites)}
        >
          {showFavorites ? "Show All Images" : "❤️ Favourites Only"}
        </button>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name (A–Z)</option>
        </select>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="statistics">
        <div className="stat-card">
          <h3>Total Images</h3>
          <p>{totalImages}</p>
        </div>

        <div className="stat-card">
          <h3>Favourites</h3>
          <p>{totalFavorites}</p>
        </div>

        <div className="stat-card">
          <h3>Currently Showing</h3>
          <p>{visibleImages}</p>
        </div>
      </div>

      <div className="gallery">
        {sortedImages.map((image) => (
          <div className="image-card" key={image.id}>
            <img src={image.url} alt={image.name} />

            <p className="image-name">{image.name}</p>

            <div className="card-buttons">
              <button
                onClick={() =>
                  dispatch(toggleFavorite(image.id))
                }
              >
                {image.isFavorite
                  ? "❤️ Favorited"
                  : "🤍 Favourite"}
              </button>

              <button
                className="delete-button"
                onClick={() => handleDelete(image.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {visibleImages === 0 && (
        <p className="empty-message">
          {showFavorites
            ? "No favourite images found."
            : "No images found."}
        </p>
      )}
    </div>
  );
}

export default App;
