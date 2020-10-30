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
              Get Started
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
