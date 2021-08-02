import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const features = [
  {
    title: <>js-dos</>,
    imageUrl: 'img/jsdos-logo.png',
    description: (
      <>
        js-dos was designed from the ground up to be easily installed and
        used to get your DOS program up and running in browser quickly.<br/>
        <code>
          Dos(element).run("game.jsdos")
        </code><br/>
        <a href="docs">Read more</a>
      </>
    ),
  },
  {
    title: <>emulators-ui</>,
    imageUrl: 'img/emulators-ui-logo.jpg',
    description: (
      <>
        emulators-ui is a default set of components that used to build js-dos player ui.
        You can reuse them to build your custom DOS player.<br/>
        <a href="docs/threejs">Creating three.js player</a>
      </>
    ),
  },
  {
    title: <>emulators</>,
    imageUrl: 'img/emulators-logo.png',
    description: (
      <>
        emulators is a core of js-dos, it has standardized api and can run emulation in different
        environments. Perfect solution for custom embedding. <br/>
        <a href="docs/estimating-performance">Estimating performance</a>
      </>
    ),
  },
    {
        title: <>bundles repository</>,
        imageUrl: 'img/repository.png',
        description: (
            <>
              Community driven js-dos repository contains <br/>
              <strong style={{background: "#8f398f", color: "white", padding: "2px 4px"}}>2000+ bundles are ready to run in browser</strong><br/>
              <a href="https://talks.dos.zone/t/collections/44653" target="_blank">View repository</a>
            </>
        ),
    },
    {
        title: <>dos.zone</>,
        imageUrl: 'img/dz.png',
        description: (
            <>
              DOS.Zone is a kitchen sink application that demonstrate all features of js-dos v7<br/>
              <a href="https://dos.zone" target="_blank">Live Demo</a><br/>
              <br/>
              <a href="https://play.google.com/store/apps/details?id=zone.dos.app" target="_blank">
                <img style={{width: "40%"}} src="/v7/build/img/gp.png"/>
              </a>
            </>
        ),
    },
    {
        title: <>turbo mode</>,
        imageUrl: 'img/turbo.png',
        description: (
            <>
              js-dos can communicate with Web-RTC backend to play DOS games in the cloud. No matter which hardware you use all dos games will work smoothly.
              <br/>
              <a href="https://talks.dos.zone/t/dos-cloud-gaming-aka-turbo/44592" target="_blank">Read more</a>
            </>
        ),
    },
    {
        title: <>node.js support</>,
        imageUrl: 'img/node.png',
        description: (
            <>
              Emulators package supports execution in node.js environment.
              It means that you can start dos program in node.js without hacks.<br/>
              <a href="docs/node">Read more</a>
            </>
        ),
    },
    {
        title: <>typescirpt support</>,
        imageUrl: 'img/ts.png',
        description: (
            <>
              All source code of js-dos is written in TypeScript. So, you can use
              type checking when you use js-dos.<br/>
              <a href="docs/react">Read more</a>
            </>
        ),
    },
    {
        title: <>react support</>,
        imageUrl: 'img/react.png',
        description: (
            <>
              js-dos can be easily wrapped as react component.<br/>
              <a href="docs/react">Creating React component</a>
            </>
        ),
    },
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="js-dos v7 simplies API to run DOS games in browser<head />">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/')}>
              Documentation
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
