const endBtn = document.getElementById("endParkingBtn");

async function startParking(parkingId) {
  const res = await API.startSession(parkingId);

  if (res.message?.includes("started")) {
    alert("Parking started 🚗");
    endBtn.style.display = "block";
  } else {
    alert(res.message);
  }
}

endBtn.addEventListener("click", async () => {
  const res = await API.endSession();

  alert(
    `Parking ended\nHours: ${res.duration_hours}\nPaid: ${res.payment.amount}`
  );

  endBtn.style.display = "none";
});

