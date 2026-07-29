export type GitCommitRaw = {
  sha: string;
  parents: string[];
  message: string;
  author: string;
  date: string;
  refs?: string[];
};

export type GitNode = GitCommitRaw & {
  x: number;
  y: number;
  colorIndex: number;
  lane: number;
};

export type GitLink = {
  id: string;
  source: string;
  target: string;
  sourcePos: { x: number; y: number };
  targetPos: { x: number; y: number };
  colorIndex: number;
  isMerge: boolean;
};

export type GitGraphContext = {
  nodes: GitNode[];
  links: GitLink[];
  width: number;
  height: number;
};

/**
 * Motor Topológico para grafos de Git
 * @param commits Array de commits ordenados del más RECIENTE al más ANTIGUO (orden natural de \`git log\`)
 * @param xSpacing Distancia horizontal entre commits
 * @param ySpacing Distancia vertical entre carriles (lanes)
 */
export function computeGitGraph(
  commits: GitCommitRaw[],
  xSpacing: number = 60,
  ySpacing: number = 40
): GitGraphContext {
  const nodes: GitNode[] = [];
  const activeLanes: (string | null)[] = [];

  const getFreeLane = () => {
    for (let i = 0; i < activeLanes.length; i++) {
      if (activeLanes[i] === null) return i;
    }
    return activeLanes.length;
  };

  // Iteramos desde el más reciente (i=0) al más antiguo (i=N-1).
  // Visualmente, el más antiguo estará a la izquierda (x = 0).
  for (let i = 0; i < commits.length; i++) {
    const commit = { ...commits[i] };
    
    // Fallback de Degradación Elegante:
    // Si la base de datos no tiene los padres de este commit (porque es histórico o falló la API),
    // asumimos por defecto que su padre es el commit inmediatamente más antiguo en la lista.
    if (commit.parents.length === 0 && i < commits.length - 1) {
      commit.parents = [commits[i + 1].sha];
    }
    
    // Determinamos el carril. ¿Estábamos esperando este commit en algún carril activo?
    let lane = activeLanes.indexOf(commit.sha);
    
    // Si no lo estábamos esperando (ej. es la punta de una rama), le asignamos un carril libre.
    if (lane === -1) {
      lane = getFreeLane();
    }
    
    // El commit más antiguo tiene i=(length-1), su X será 0 (izquierda).
    // El más reciente tiene i=0, su X será máximo (derecha).
    const x = (commits.length - 1 - i) * xSpacing;
    const y = lane * ySpacing;
    
    nodes.push({
      ...commit,
      x,
      y,
      colorIndex: lane,
      lane,
    });
    
    // Actualizamos el seguimiento de los carriles hacia el pasado.
    if (commit.parents.length > 0) {
      // El primer padre continúa en el mismo carril principal.
      activeLanes[lane] = commit.parents[0];
      
      // Los padres adicionales (es un merge commit) demandan abrir carriles auxiliares
      // para ir a buscarlos en el pasado.
      for (let p = 1; p < commit.parents.length; p++) {
        const freeLane = getFreeLane();
        activeLanes[freeLane] = commit.parents[p];
      }
    } else {
      // Es un "Initial Commit" (sin padres), el carril se cierra/libera hacia el pasado.
      activeLanes[lane] = null;
    }
  }

  // Segunda pasada: Conectar nodos (Links/Edges)
  const links: GitLink[] = [];
  
  for (const node of nodes) {
    for (let p = 0; p < node.parents.length; p++) {
      const parentSha = node.parents[p];
      const parentNode = nodes.find((n) => n.sha === parentSha);
      
      if (parentNode) {
        links.push({
          id: `${node.sha}-${parentSha}`,
          source: node.sha,
          target: parentNode.sha,
          sourcePos: { x: node.x, y: node.y },
          targetPos: { x: parentNode.x, y: parentNode.y },
          // Si es la línea principal, toma el color del hijo. 
          // Si es una rama fusionándose (merge), que la línea secundaria mantenga el color de la rama que muere (el target en el pasado).
          colorIndex: p === 0 ? node.colorIndex : parentNode.colorIndex,
          isMerge: p > 0,
        });
      }
    }
  }

  // Padding visual para que los nodos no queden cortados en los bordes
  const paddingX = 40;
  const paddingY = 40;

  // Ajustar coordenadas inyectando padding
  nodes.forEach(n => {
    n.x += paddingX;
    n.y += paddingY;
  });
  links.forEach(l => {
    l.sourcePos.x += paddingX;
    l.sourcePos.y += paddingY;
    l.targetPos.x += paddingX;
    l.targetPos.y += paddingY;
  });

  const width = commits.length * xSpacing + paddingX * 2;
  const height = (activeLanes.length) * ySpacing + paddingY * 2;

  return { nodes, links, width, height };
}
