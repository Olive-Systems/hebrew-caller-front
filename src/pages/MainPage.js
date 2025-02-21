import React, { useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

// Move helper functions outside
function instructionsContent() {
  return `Talk to user about anything but YOU lead the conversation and decide topics`;
}

const MainPage = () => {
  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const { settings } = useSettings();
  
  async function init() {
    try {
      // Cleanup any existing connection
      if (pcRef.current) {
        pcRef.current.close();
      }

      // Create new connection with specific configuration
      pcRef.current = new RTCPeerConnection({
        sdpSemantics: 'unified-plan'
      });
      
      // Monitor connection state
      pcRef.current.onconnectionstatechange = () => {
        console.log(`Connection state: ${pcRef.current.connectionState}`);
      };
      
      pcRef.current.onicegatheringstatechange = () => {
        console.log(`ICE gathering state: ${pcRef.current.iceGatheringState}`);
      };

      pcRef.current.onsignalingstatechange = () => {
        console.log(`Signaling state: ${pcRef.current.signalingState}`);
      };

      // Get local audio stream first
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Add audio track before creating data channel
      pcRef.current.addTrack(localStream.getAudioTracks()[0], localStream);

      // Create data channel after adding audio track
      dcRef.current = pcRef.current.createDataChannel("oai-events");
      
      const tokenResponse = await fetch("https://secure-ridge-04778-a90e87c501f6.herokuapp.com/session");
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret.value;

      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();
      let recorder;

      const localSource = audioContext.createMediaStreamSource(localStream);
      localSource.connect(destination);

      pcRef.current.ontrack = e => {
        const remoteStream = e.streams[0];
        audioEl.srcObject = remoteStream;
        const remoteSource = audioContext.createMediaStreamSource(remoteStream);
        remoteSource.connect(destination);
        if (!recorder) {
          recorder = new MediaRecorder(destination.stream);
          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              uploadChunk(event.data);
            }
          };
          recorder.start(1000);
        }
      };

      let conversationId = new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/[,:]/g, '').replace(/\s/g, '');

      function uploadChunk(chunk) {
        fetch(`https://secure-ridge-04778-a90e87c501f6.herokuapp.com/upload_audio?conversationId=${conversationId}`, {
          method: "POST",
          headers: {
            "Content-Type": "audio/webm"
          },
          body: chunk
        }).catch(err => console.error("Error uploading chunk:", err));
      }

      dcRef.current.addEventListener("message", (e) => {
        let data = e.data;
        if(data) {
          let parsed = JSON.parse(data);
          if(parsed.type === 'session.created') {
            console.log("Session was surely created");
            sendInitialInstructions();
          }
        }
      });

      // Create and set local description
      const offer = await pcRef.current.createOffer();
      console.log("Created offer:", offer.sdp);
      await pcRef.current.setLocalDescription(offer);

      // Wait for ICE gathering to complete
      await new Promise(resolve => {
        if (pcRef.current.iceGatheringState === 'complete') {
          resolve();
        } else {
          pcRef.current.onicegatheringstatechange = () => {
            if (pcRef.current.iceGatheringState === 'complete') {
              resolve();
            }
          };
        }
      });

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: pcRef.current.localDescription.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`SDP response error: ${sdpResponse.status}`);
      }

      const answerSdp = await sdpResponse.text();
      console.log("Received answer:", answerSdp);

      const answer = {
        type: "answer",
        sdp: answerSdp,
      };

      // Only set remote description if we're in a valid state to do so
      if (pcRef.current && (pcRef.current.signalingState === "have-local-offer" || pcRef.current.signalingState === "stable")) {
        try {
          await pcRef.current.setRemoteDescription(answer);
        } catch (e) {
          console.log("Ignoring redundant setRemoteDescription");
        }
      } else {
        console.warn("Skipping setRemoteDescription, current state:", pcRef.current?.signalingState);
      }
    } catch (error) {
      console.error("WebRTC setup failed:", error);
      // Cleanup on error
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    }
  }

  function sendInitialInstructions() {
    const instructionsEvent = {
      type: "session.update",
      session: settings.mainPrompt,
    };
    setTimeout(() => {
      const promptImmediateResponse = {
        type: "response.create",
        response: settings.immediateResponse,
      };
      dcRef.current.send(JSON.stringify(promptImmediateResponse));
    }, 500);
    dcRef.current.send(JSON.stringify(instructionsEvent));
  }

  useEffect(() => {
    init();
    
    // Cleanup function
    return () => {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, []);

  return (
    <div className="App">
      <img src={'ai.png'} alt="AI" />
    </div>
  );
};

export default MainPage; 