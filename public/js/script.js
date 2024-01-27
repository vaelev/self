$(document).ready(function() {
    $('#prompt').keypress(function(event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            $('form').submit();
        }
    });

    $('form').on('submit', async function(event) {
        event.preventDefault();

        var prompt = $('#prompt').val().trim();
        if (!prompt) {
            console.log('Prompt is empty');
            return;
        }

        var dateTime = new Date();
        var time = dateTime.toLocaleTimeString();

        $('#response').prepend('<p>(' + time + ') <i class="bi bi-person"></i>: ' + prompt + '</p>');
        $('#prompt').val('');

        try {
            const response = await fetch("/aiCompletion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userPrompt: prompt }),
            });

            if (!response.ok || !response.body) {
                throw new Error(response.statusText);
            }

            const newElement = $('<p>(' + time + ') <i class="bi bi-chat-left-text-fill"></i>: </p>');
            $('#response').prepend(newElement);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const decodedChunk = decoder.decode(value, { stream: true });
                newElement.append(decodedChunk);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
