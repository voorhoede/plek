<template>
  <section>
    <div class="hero-flow-item">
      <h3>Flexible</h3>
      <ul class="hero-flow-item-ci">
        <li>
          <figure>
            <img src="./logos/circleci.svg" alt="" width="120">
            <figcaption>CircleCI</figcaption>
          </figure>
        </li>
        <li>
          <figure>
            <img src="./logos/travis-ci.png" alt="">
            <figcaption>Travis CI</figcaption>
          </figure>
        </li>
      </ul>
      <p>
        Run Plek from your favorite CI environment wherever you want.
      </p>
    </div>
    <div class="hero-flow-item">
      <h3>Service-Powered</h3>
      <ul class="hero-flow-item-deploy">
        <li>
          <figure>
            <img src="./logos/now.svg" alt="">
            <figcaption>ZEIT Now</figcaption>
          </figure>
        </li>
        <li>
          <figure>
            <img src="./logos/fly.svg" alt="">
            <figcaption>Fly</figcaption>
          </figure>
        </li>
        <li>
          <figure>
            <img src="./logos/bash.svg" alt="">
            <figcaption>Custom scripts</figcaption>
          </figure>
        </li>
      </ul>
      <p>
        Go with configured serverless services out of the box or run your own scripts.
      </p>
    </div>
    <div class="hero-flow-item">
      <h3>Integrated</h3>
      <ul>
        <li>
          <figure>
            <img src="./logos/github.svg" alt="">
            <figcaption>GitHub</figcaption>
          </figure>
        </li>
      </ul>
      <p>View deployment status per commit and view pull request 'preview deployments'.</p>
    </div>
  </section>
</template>

<script>
</script>

<style scoped>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 2rem;
    padding-bottom: 2rem;
  }

  .hero-flow-item {
    width: 100%;
    text-align: center;
    box-shadow: none;
    margin-bottom: 1rem;
  }

  ul,
  li,
  figure {
    height: 10rem;
    margin: 0;
  }

  ul {
    list-style: none;
    overflow-y: hidden;
  }

  .hero-flow-item li {
    animation-duration: 5s;
    animation-direction: alternate-reverse;
    animation-iteration-count: infinite;
    animation-timing-function: cubic-bezier(0.65, 0.05, 0.36, 1);
    animation-delay: 1s;
    margin-bottom: 5rem;
  }

  .hero-flow-item-ci li {
    animation-name: twoStepScroll;
  }

  .hero-flow-item-deploy li {
    animation-name: threeStepScroll;
    animation-delay: 4s;
  }

  h3 {
    margin-bottom: 2rem;
    text-transform: uppercase;
    font-size: 1em;
    font-weight: 500;
  }

  img {
    height: 70%;
    width: auto;
    vertical-align: middle;
  }

  figcaption {
    height: 30%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
  }

  p {
    min-height: 6rem;
    display: block;
    margin-right: 1rem;
    margin-left: 1rem;
  }

  @keyframes twoStepScroll {
    0%, 45% {
      transform: translateY(-15rem);
    }

    55%, 100% {
      transform: translateY(0);
    }
  }

  @keyframes threeStepScroll {
    0%, 28% {
      transform: translateY(-30rem);
    }

    38%, 72% {
      transform: translateY(-15rem);
    }

    82%, 100% {
      transform: translateY(0);
    }
  }

  @media (min-width: 40rem) {
    section {
      flex-direction: row;
    }

    .hero-flow-item {
      width: calc(100% / 3);
      margin-bottom: 0;
    }
  }
</style>
