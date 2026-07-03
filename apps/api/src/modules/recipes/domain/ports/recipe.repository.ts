import { RecipeEntity } from "../entities/recipe.entity";

export const RECIPE_REPOSITORY = Symbol("RECIPE_REPOSITORY");

export interface RecipeNoteEntity {
  id: string;
  recipeId: string;
  comment: string;
  rating: number;
  author?: string | null;
  createdAt: Date;
}

export interface RecipeHistoryEntity {
  id: string;
  recipeId: string;
  action: string;
  versionNumber: number;
  summary: string;
  snapshot: unknown;
  noteId?: string | null;
  rating?: number | null;
  author?: string | null;
  createdAt: Date;
}

export interface RecipeTimeline {
  recipe: RecipeEntity;
  notes: RecipeNoteEntity[];
  history: RecipeHistoryEntity[];
}

export interface AddRecipeNoteInput {
  recipeId: string;
  comment: string;
  rating: number;
  author?: string;
}

export interface ApproveRecipeForProductionInput {
  recipeId: string;
  approvedBy?: string;
  notes?: string;
}

export interface RestoreRecipeVersionInput {
  recipeId: string;
  versionNumber: number;
  restoredBy?: string;
  notes?: string;
}

export interface ApproveRecipeVersionForProductionInput {
  recipeId: string;
  versionNumber: number;
  approvedBy?: string;
  notes?: string;
}

export interface RecipeRepository {
  create(recipe: RecipeEntity): Promise<RecipeEntity>;
  update(id: string, recipe: Partial<RecipeEntity>): Promise<RecipeEntity>;
  findById(id: string): Promise<RecipeEntity | null>;
  findAll(): Promise<RecipeEntity[]>;
  findProductionRecipes(): Promise<RecipeEntity[]>;
  findTimeline(id: string): Promise<RecipeTimeline | null>;
  addNote(input: AddRecipeNoteInput): Promise<RecipeTimeline>;
  approveForProduction(input: ApproveRecipeForProductionInput): Promise<RecipeTimeline>;
  restoreVersion(input: RestoreRecipeVersionInput): Promise<RecipeTimeline>;
  approveVersionForProduction(input: ApproveRecipeVersionForProductionInput): Promise<RecipeTimeline>;
  delete(id: string): Promise<void>;
}
