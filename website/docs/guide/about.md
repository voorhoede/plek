# About Plek
*Make continuous deployment delightful.*

Plek is a GitHub integration and command line tool that runs from a continuous integration service, and it makes it easier to deploy changes and to give feedback on pull requests. Plek accomplishes this by providing the following features:

## Structure
In three steps Plek simplifies the deployment flow:

1. **Cleanup**  
   Removes old deployments and domain aliases that have already been merged into the master branch.
2. **Deployment**  
   Coupled to the deployment step, make the deployment accessible through a domain.
3. **Aliasing**  
   Together with the deployment step, it makes the deployment accessible through a domain alias.

Each step is available as a separate command which can be used in custom scripts.

## Services
With pre-configured services, it only takes a single command to run the necessary steps. Currently, Plek provides built-in support for [ZEIT Now](https://zeit.co/now) and [Fly.io](https://fly.io/).

## Integration
With GitHub integration, each commit shows the deployment status and every pull request provides a 'preview' deployment.

## Why Plek
The primary goal of Plek is to make continuous deployment easy without vendor lock-in. So how does Plek compare to other great services like [Netlify](https://www.netlify.com/)? By focusing on the deployment and integration with other services Plek brings your tools together. Plek takes more work to set up but provides more flexibility. What about CI & Bash scripts? Compared to these Plek takes less work to set up because it takes care of the details. However, Plek & Bash scripts work well together especially in cases where more control is needed.

## What’s in a name?
The name **Plek** originates from the Latin word *displicāre* which means: to scatter (dis-, dis- + plicāre). It is the origin of the words 'deploy' and 'display' in Indo-European roots. Besides that, it's also the Dutch word for 'place'.
