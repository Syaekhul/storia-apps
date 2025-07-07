import Swal from "sweetalert2";

let stream;

export async function initCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById("cameraPreview");
    video.srcObject = stream;
    video.style.display = "block";
    return stream;
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Tidak dapat mengakses kamera. Silakan periksa izin kamera Anda.",
      confirmButtonText: "Tutup"
    });
    console.error(err);
    return null;
  }
}

export function stopCamera() {
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    stream = null;
  }

  document.getElementById("cameraPreview").style.display = "none";
}
