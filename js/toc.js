---
layout: null
---

var totalTopics = 0;
var outputLetNav = new Array();
var outputHorzTabs = new Array();
var currentSection;
var sectionToHighlight;

function findMyTopic(tree)
{
  function processBranch(branch)
  {
    for (var k=0;k<branch.length;k++)
    {
      if (branch[k].section) {
        processBranch(branch[k].section);
      } else {
        if (branch[k].path == pageURL && !branch[k].nosync)
        {
          console.log(branch[k].path + ' was == ' + pageURL)
          thisIsIt = true;
          break;
        } else {
          console.log(branch[k].path + ' was != ' + pageURL)
        }
      }
    }
  }
  var thisIsIt = false;
  processBranch(tree)
  return thisIsIt;
}
function walkTree(tree)
{
  for (var j=0;j<tree.length;j++)
  {
    totalTopics++;
    if (tree[j].section)
    {
      var sectionHasPath = findMyTopic(tree[j].section);
      outputLetNav.push('<li><a onclick="navClicked(' + totalTopics +')" data-target="#item' + totalTopics +'" data-toggle="collapse" data-parent="#stacked-menu"')
      if (sectionHasPath)
      {
        outputLetNav.push('aria-expanded="true"')
      } else {
        outputLetNav.push('class="collapsed" aria-expanded="false"')
      }
      outputLetNav.push('>' + tree[j].sectiontitle + '<span class="caret arrow"></span></a>');
      outputLetNav.push('<ul class="nav collapse');
      if (sectionHasPath) outputLetNav.push(' in');
      outputLetNav.push('" id="#item' + totalTopics + '" aria-expanded="');
      if (sectionHasPath)
      {
        outputLetNav.push('true');
      } else {
        outputLetNav.push('false');
      }
      outputLetNav.push('">');
      var subTree = tree[j].section;
      walkTree(subTree);
      outputLetNav.push('</ul></li>');
    } else if (tree[j].generateTOC) {
      // auto-generate a TOC from a collection
      walkTree(collectionsTOC[tree[j].generateTOC])
    } else {
      // just a regular old topic; this is a leaf, not a branch; render a link!
      outputLetNav.push('<li><a href="' + tree[j].path + '"')
      if (tree[j].path == pageURL && !tree[j].nosync)
      {
        sectionToHighlight = currentSection;
        outputLetNav.push('class="active currentPage"')
      }
      outputLetNav.push('>'+tree[j].title+'</a></li>')
    }
  }
}

function renderNav(toc) {
  for (i=0;i<toc.horizontalnav.length;i++)
  {
    if (toc.horizontalnav[i].node != "glossary")
    {
      currentSection = toc.horizontalnav[i].node;
      // build vertical nav
      var itsHere = findMyTopic(docstoc[toc.horizontalnav[i].node]);
      if (itsHere || toc.horizontalnav[i].path == pageURL)
      {
        walkTree(toc[toc.horizontalnav[i].node]);
      }
    }
    // build horizontal nav
    outputHorzTabs.push('<li id="' + toc.horizontalnav[i].node + '"');
    if (toc.horizontalnav[i].path==pageURL || toc.horizontalnav[i].node==sectionToHighlight)
    {
      outputHorzTabs.push(' class="active"');
    }
    outputHorzTabs.push('><a href="'+toc.horizontalnav[i].path+'">'+toc.horizontalnav[i].title+'</a></li>\n');
  }
  if (outputLetNav.length==0)
  {
    // didn't find the current topic in the standard TOC; maybe it's a collection;
    for (var key in collectionsTOC)
    {
      var itsHere = findMyTopic(collectionsTOC[key]);
      if (itsHere) {
        walkTree(collectionsTOC[key]);
        break;
      }
    }
    // either glossary was true or no left nav has been built; default to glossary
    // show pages tagged with term and highlight term in left nav if applicable
    renderTagsPage()
    for (var i=0;i<glossary.length;i++)
    {
      var highlightGloss = '';
      if (tagToLookup) highlightGloss = (glossary[i].term.toLowerCase()==tagToLookup.toLowerCase()) ? ' class="active currentPage"' : '';
      outputLetNav.push('<li><a'+highlightGloss+' href="/glossary/?term=' + glossary[i].term + '">'+glossary[i].term+'</a></li>');
    }
  }
  document.getElementById('jsTOCHorizontal').innerHTML = outputHorzTabs.join('');
  document.getElementById('jsTOCLeftNav').innerHTML = outputLetNav.join('');
}

var docstoc = {{ site.data.toc | jsonify }};
renderNav(docstoc);

