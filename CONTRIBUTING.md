<img src="https://cdn.edge.network/assets/img/edge-logo-green.svg" width="200">

# Contributor Guidelines

GM contributors! First of all, thanks so much for taking the time to chip in. We've set out some quick guidelines to help you get started. Please give them a read, and if you have any questions, just [ask](https://discord.gg/edgenetwork)!

## How can I contribute?

There are two ways you can contribute to projects:

- Reporting bugs and issues
- Writing code and submitting pull requests

## Reporting bugs and issues

When you report a bug and/or issue, please make sure to include the following:

- The name of the project
- The issue or bug description
- The steps to reproduce the issue
- The expected result
- The actual result

If you can provide screenshots or videos of the steps to reproduce the issue, that'd be awesome.

## Writing code

When you're adding code to a project, please try and keep the code clean and well documented. Look at how the code is organized and try to follow the same structure. If you have any questions, you can [ask us](https://discord.gg/edgenetwork) on Discord. Someone friendly's always around.

### Git commits

We use present tense ("add feature" not "added feature") and the imperative ("move cursor to..." not "moves cursor to...") form of commit messages. Use a short one-line summary of your change. If you want, you can also reference issues and pull requests liberally after the first line.

The format generally looks like this:

```
type: subject                            // header

Optional long description                // body
```

We use semantic prefixes for commit messages. These are the eight prefixes you'll need to pick from:

| prefix   | purpose                                                                                           |
|----------|---------------------------------------------------------------------------------------------------|
| chore    | changes to the build process or auxiliary tools and libraries such as documentation generation    |
| debug    | for debugging                                                                                     |
| docs     | documentation only changes                                                                        |
| feat     | a new feature                                                                                     |
| fix      | a bug fix                                                                                         |
| perf     | a code change that improves performance                                                           |
| refactor | a code change that neither fixes a bug nor adds a feature                                         |
| test     | adding or improving tests                                                                         |

An example commit message that fits these requirements looks like this:

`feat: add create wallet functionality`

Finally, we keep all one-line summary commit messages in lowercase, with no end of sentence punctuation.

### One change per commit

A commit should contain exactly one logical change. A logical change could be adding a new feature, fixing a specific bug, etc. If it's not possible to describe the high level change in a few words, it's most likely too complex for a single commit. The diff itself should be as concise as possible and it's almost always better to err on the side of too many patches than too few. As a rule of thumb, with only your commit message in-hand, another developer should be able to implement the same patch in a reasonable amount of time.

Please don't include more than one change in each patch. If your commit message requires an "and" in the middle, you'll need separate commits.

### Target branch

The development branch for this project is **develop**.

Please ensure that your contributions are based on this branch and that your Pull Request specifies it as the target branch.

### Linking a Pull Request to an issue

You're welcome to use the `fix #123`, `close #123` keywords to link your Pull Request to the issue it addresses (if one exists). You should put this in the extended 'body' of the commit message, not the first line.

For more information on this GitHub feature, see [Linking a pull request to an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)
