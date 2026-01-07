document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <h5>Participants (${details.participants.length}/${details.max_participants})</h5>
            <ul class="participants-list" style="list-style-type: none; padding-left: 0;">
            </ul>
            ${details.participants.length === 0 ? `<p class="no-participants">No participants yet</p>` : ''}
          </div>
        `;

        // Add participants with delete icon
        const ul = activityCard.querySelector('.participants-list');
        details.participants.forEach((participant) => {
          const li = document.createElement('li');
          li.style.display = 'flex';
          li.style.alignItems = 'center';

          const span = document.createElement('span');
          span.textContent = participant;
          span.style.flexGrow = '1';

          const deleteBtn = document.createElement('button');
          deleteBtn.innerHTML = '🗑️';
          deleteBtn.title = 'Unregister';
          deleteBtn.style.marginLeft = '8px';
          deleteBtn.style.background = 'none';
          deleteBtn.style.border = 'none';
          deleteBtn.style.cursor = 'pointer';
          deleteBtn.style.fontSize = '1em';

          deleteBtn.addEventListener('click', async () => {
            if (confirm(`Unregister ${participant} from ${name}?`)) {
              try {
                const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(participant)}`, {
                  method: 'POST',
                });
                const result = await response.json();
                if (response.ok) {
                  fetchActivities();
                } else {
                  alert(result.detail || 'Failed to unregister.');
                }
              } catch (err) {
                alert('Failed to unregister.');
              }
            }
          });

          li.appendChild(span);
          li.appendChild(deleteBtn);
          ul.appendChild(li);
        });

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list after successful signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
