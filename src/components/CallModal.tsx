import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CallModal({ storyId, creatorId, onClose }: { storyId: string, creatorId: string, onClose: () => void }) {
  const { user } = useAuth();
  const [status, setStatus] = useState('Requesting call...');
  const [requestId, setRequestId] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const [requests, setRequests] = useState<any[]>([]);
  const isCreator = user?.id === creatorId;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let currentRequestId = '';

    const initCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        
        if (isCreator) {
          // Creator polling for requests
          setStatus('Waiting for calls...');
          interval = setInterval(async () => {
            if (currentRequestId) return; // already in a call
            const res = await fetch(`/api/stories/${storyId}/call`);
            const data = await res.json();
            if (data.requests && data.requests.length > 0) {
              setRequests(data.requests);
            }
          }, 2000);
        } else {
          // Viewer requests a call
          const res = await fetch(`/api/stories/${storyId}/call`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'request', creatorId })
          });
          const data = await res.json();
          
          if (data.error) {
            setStatus('Error: ' + data.error);
            return;
          }
          
          currentRequestId = data.requestId;
          setRequestId(currentRequestId);
          setStatus('Waiting for creator to accept...');

          // Poll for acceptance
          interval = setInterval(async () => {
            const pollRes = await fetch(`/api/stories/${storyId}/call?requestId=${currentRequestId}`);
            const pollData = await pollRes.json();
            
            if (pollData.status === 'ACCEPTED') {
              setStatus('Call accepted! Connecting...');
              clearInterval(interval);
              startWebRTC(currentRequestId, false);
            } else if (pollData.status === 'DECLINED') {
              setStatus('Call was declined.');
              clearInterval(interval);
            }
          }, 2000);
        }
      } catch (err) {
        setStatus('Failed to access camera/mic.');
      }
    };

    initCall();
    return () => {
      if (interval) clearInterval(interval);
      if (localStream.current) localStream.current.getTracks().forEach(t => t.stop());
      if (peerConnection.current) peerConnection.current.close();
    };
  }, [storyId, creatorId, isCreator]);

  const acceptRequest = async (reqId: string) => {
    await fetch(`/api/stories/${storyId}/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accept', requestId: reqId })
    });
    setRequestId(reqId);
    setRequests([]);
    startWebRTC(reqId, true);
    setStatus('Connected');
  };

  const startWebRTC = async (reqId: string, isCreator: boolean) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    peerConnection.current = pc;

    localStream.current?.getTracks().forEach(track => {
      pc.addTrack(track, localStream.current!);
    });

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject !== event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await fetch(`/api/stories/${storyId}/call`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ice', requestId: reqId, candidate: event.candidate })
        });
      }
    };

    if (!isCreator) { // Viewer creates offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await fetch(`/api/stories/${storyId}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'offer', requestId: reqId, offer })
      });
    }

    // Poll for SDP & ICE
    const sdpInterval = setInterval(async () => {
      const res = await fetch(`/api/stories/${storyId}/call?requestId=${reqId}`);
      const data = await res.json();
      
      if (!isCreator && data.answer && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data.answer)));
        setStatus('Connected');
      } else if (isCreator && data.offer && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data.offer)));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await fetch(`/api/stories/${storyId}/call`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'answer', requestId: reqId, answer })
        });
        setStatus('Connected');
      }

      if (data.iceCandidates) {
        const candidates = JSON.parse(data.iceCandidates);
        for (const c of candidates) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          } catch(e) {}
        }
      }
    }, 2000);

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setStatus('Disconnected');
        clearInterval(sdpInterval);
      }
    };
  };

  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">CREATOR CALL</h2>
          <span className="text-sm text-zinc-400">{status}</span>
        </div>
        
        <div className="relative flex-1 bg-black aspect-video flex items-center justify-center">
          {requests.length > 0 && !requestId && (
            <div className="absolute inset-0 bg-zinc-900/90 z-20 flex flex-col items-center justify-center space-y-4">
              <h3 className="text-white font-bold text-lg">Incoming Call Requests</h3>
              {requests.map(req => (
                <div key={req.id} className="bg-zinc-800 p-4 rounded-xl flex items-center gap-4">
                  <span className="text-white">Viewer Request #{req.id.slice(-4)}</span>
                  <button onClick={() => acceptRequest(req.id)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold">Accept</button>
                  <button onClick={onClose} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold">Decline</button>
                </div>
              ))}
            </div>
          )}
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 w-32 h-40 bg-zinc-800 rounded-xl object-cover border-2 border-zinc-700" />
        </div>

        <div className="p-4 flex justify-center gap-4 bg-zinc-950">
          <button onClick={toggleMute} className={`p-4 rounded-full ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-white'}`}>
            {isMuted ? <MicOff /> : <Mic />}
          </button>
          <button onClick={toggleVideo} className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-white'}`}>
            {isVideoOff ? <VideoOff /> : <Video />}
          </button>
          <button onClick={onClose} className="p-4 rounded-full bg-red-600 text-white hover:bg-red-500">
            <PhoneOff />
          </button>
        </div>
      </div>
    </div>
  );
}
