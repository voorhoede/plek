# About Plek
*Make continuous deployment delightful.*

Plek is a GitHub integration and command line tool run from a continuous integration service to make it easier to deploy changes and give feedback on pull requests. Plek does this by providing:

### Structure
In three steps Plek simplifies the deployment flow:
1. **Cleanup**  
Remove old deployments and domain aliases that are already merged with the master branch.
2. **Deployment**  
Deploy the latest commit on master or deploy pull request changes to preview.  
3. **Aliasing**  
Coupled to the deployment step, make the deployment accessible through a domain.

Each step is available as a separate command which can be used to run custom scripts.

### Services
With pre-configured services it takes a single command to run the above steps. Currently Plek provides [ZEIT Now](https://zeit.co/now) out of the box with more to come.

### Integration
With GitHub integration each commit shows the deployment status and every pull request provides a ‘preview’ deployment.

# Why Plek
The main goal of Plek is to make continuous deployment easy without vendor lock-in. So how does Plek compare to other great services like [netlify](https://www.netlify.com/)? By focusing on the deployment and integration with other services Plek is part of a combination of tools. Plek takes more work to set up but provides more flexibility. What about CI & Bash scripts? Compared to these Plek takes less work to set up because it takes care of the details. However Plek & Bash scripts also go well together if more control is needed.

## What’s in a name?
The name *plek* comes from Latin displicāre, to scatter: dis-, dis- + plicāre, it is the root of the word ‘deploy’ and ‘display’ in Indo-European roots. Besides that it’s also the Dutch word for *place*…
