import { useEffect, useRef, useState } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

interface GoogleSignInButtonProps {
  /** Google tra ve ID token (credential) sau khi nguoi dung chon tai khoan */
  onCredential: (credential: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

/**
 * Nut "Dang nhap bang Google" chinh thuc (Google Identity Services).
 * Script GIS nap async trong index.html -> doi script san sang roi moi ve nut.
 */
export function GoogleSignInButton({ onCredential, text = 'signin_with' }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const [failed, setFailed] = useState(false);
  callbackRef.current = onCredential;

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    let tries = 0;

    const render = () => {
      if (cancelled) return;
      const gis = window.google?.accounts?.id;
      if (!gis || !containerRef.current) {
        // Script chua tai xong -> thu lai, toi da ~10 giay
        if (++tries > 50) setFailed(true);
        else setTimeout(render, 200);
        return;
      }
      gis.initialize({
        client_id: CLIENT_ID,
        callback: (res) => callbackRef.current(res.credential),
        ux_mode: 'popup',
      });
      containerRef.current.innerHTML = '';
      gis.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text,
        locale: 'vi',
        width: containerRef.current.offsetWidth || 320,
      });
    };
    render();
    return () => {
      cancelled = true;
    };
  }, [text]);

  // Chua cau hinh Client ID -> khong hien nut
  if (!CLIENT_ID) return null;
  if (failed) {
    return <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Không tải được đăng nhập Google. Vui lòng tải lại trang.</p>;
  }
  return <div ref={containerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center', minHeight: 44 }} />;
}
