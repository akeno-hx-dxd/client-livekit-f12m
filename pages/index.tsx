'use client';

import type { NextPage } from 'next';
import styles from '../styles/Home.module.scss';
import Head from 'next/head';
import Image from 'next/image';
import { JoinForm } from '../components/JoinForm';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>LiveKit Meet</title>
        <meta name="description" content="LiveKit Meet" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <header>
          <Image
            src="/livekit-components-logo.png"
            alt="LiveKit components text logo."
            width={320}
            height={38}
            priority
          />
        </header>
        <JoinForm />
      </main>
    </div>
  );
};

export default Home;