import {categoryForest,groupCategoryCards} from '../../components/manager-preview/categoryHierarchy';
it('places returned children below their real parent while preserving sibling order and original records',()=>{
 const water={id:281,name:'Águas',parent:'/categories/276'},beer={id:282,name:'Cervejas',parent:{id:276}},drinks={id:276,name:'Bebidas'},combo={id:296,name:'Combos'};
 const rows=[combo,water,beer,drinks],forest=categoryForest(rows);
 expect(forest.map(node=>node.category)).toEqual([combo,drinks]);
 expect(forest[1].children.map(node=>node.category)).toEqual([water,beer]);
 expect(forest[1].children[0].category).toBe(water);expect(rows).toEqual([combo,water,beer,drinks]);
 expect(groupCategoryCards(rows)).toHaveLength(2);expect(rows[0]).not.toHaveProperty('__pdvCategoryNode');
});
it('supports deeper descendants and keeps a filtered child visible when its parent is not returned',()=>{
 const root={id:1},child={id:2,parent:{'@id':'/categories/1'}},grandchild={id:3,parent:2};
 expect(categoryForest([grandchild,child,root])[0].children[0].children[0].category).toBe(grandchild);
 expect(categoryForest([child])[0].category).toBe(child);
});
it('does not drop categories or recurse indefinitely on invalid cyclic relations',()=>{
 const rows=[{id:1,parent:2},{id:2,parent:1},{id:3,parent:3},{name:'Sem identificador'}];
 const forest=categoryForest(rows);expect(forest.map(node=>node.category)).toEqual(rows);expect(forest.every(node=>!node.children.length)).toBe(true);
});
