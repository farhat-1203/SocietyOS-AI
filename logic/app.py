import sounddevice as sd
import numpy as np
import queue
import threading

from faster_whisper import WhisperModel
from classifier import classify, detect_priority, is_hallucination, assign_responsible, load_examples_from_csv


# CONFIG
SAMPLERATE = 16000
CHANNELS = 1
BLOCK_DURATION = 0.1
SILENCE_THRESHOLD = 0.02
SILENCE_DURATION = 1.2
MIN_SPEECH_DURATION = 1.0
MAX_RECORDING_DURATION = 15

BLOCK_SIZE = int(SAMPLERATE * BLOCK_DURATION)

audio_queue = queue.Queue()


print("Loading Faster Whisper...")
stt_model = WhisperModel("medium", device="cuda", compute_type="float16")
print("Whisper Loaded")


def audio_callback(indata, frames, time, status):
    if status:
        print(status)
    audio_queue.put(indata.copy())


def recorder():
    with sd.InputStream(
        samplerate=SAMPLERATE,
        channels=CHANNELS,
        callback=audio_callback,
        blocksize=BLOCK_SIZE,
        dtype="float32",
    ):
        print("\n🎤 Listening...\n")
        while True:
            sd.sleep(100)


def transcriber():
    recorded_blocks = []
    silent_block_count = 0
    speech_detected = False

    silence_blocks_needed = int(SILENCE_DURATION / BLOCK_DURATION)
    max_blocks = int(MAX_RECORDING_DURATION / BLOCK_DURATION)

    while True:
        block = audio_queue.get().flatten()
        rms = np.sqrt(np.mean(block ** 2))

        if rms > SILENCE_THRESHOLD:
            speech_detected = True
            silent_block_count = 0
            recorded_blocks.append(block)
        else:
            if speech_detected:
                silent_block_count += 1
                recorded_blocks.append(block)

        end_of_utterance = (
            speech_detected and silent_block_count >= silence_blocks_needed
        ) or (len(recorded_blocks) >= max_blocks)

        if end_of_utterance:
            audio = np.concatenate(recorded_blocks).astype(np.float32)
            duration = len(audio) / SAMPLERATE

            recorded_blocks = []
            silent_block_count = 0
            speech_detected = False

            if duration < MIN_SPEECH_DURATION:
                continue

            try:
                segments, info = stt_model.transcribe(
                    audio,
                    beam_size=5,
                    vad_filter=True,
                    task="translate",
                    initial_prompt=(
                        "This is a housing society complaint in Hindi, Marathi, or English "
                        "about plumbing, electrical, security, parking, or lift issues."
                    ),
                )

                text = " ".join(segment.text.strip() for segment in segments).strip()
                if not text or len(text.split()) < 3:
                    print("Skipped short or empty transcription.")
                    continue

                # Hallucination filter: skip common filler/thank-you phrases (with fuzzy matching)
                if is_hallucination(text):
                    print("Skipped hallucination/boilerplate text.")
                    continue

                category, confidence = classify(text)
                priority = detect_priority(text)
                assigned_to = assign_responsible(category, text)

                print("\n====================")
                print(f"Language   : {info.language}")
                print(f"Transcript : {text}")
                print(f"Category   : {category}")
                print(f"Confidence : {confidence}")
                print(f"Priority   : {priority}")
                print(f"Assigned To: {assigned_to}")
                print("====================\n")

            except Exception as e:
                print("Error:", e)


if __name__ == "__main__":
    threading.Thread(target=recorder, daemon=True).start()
    transcriber()