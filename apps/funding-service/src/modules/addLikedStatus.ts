import { Project } from "@shared/entities";
import { SelectQueryBuilder } from "typeorm";

export function addLikedStatusToQuery(userId: number, query: SelectQueryBuilder<Project>){
  if(userId) {
    query
.addSelect(`(EXISTS (SELECT 1 FROM \`like\` WHERE \`like\`.\`project_id\` = project.projectId AND \`like\`.\`user_id\` = :userId))`, 'liked')
      .setParameter('userId', userId);
  } else {
    query.addSelect('0', 'liked');
  }

  return query;
}