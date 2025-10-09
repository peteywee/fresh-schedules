import type { AppProps } from 'next/app';
export default function AppWrapper({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
