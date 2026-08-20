import type { OrgMember, OrgRole } from "@/lib/types";

function MemberNames({ members }: { members: OrgMember[] }) {
  if (members.length === 0) {
    return <span className="org-role__names">공석</span>;
  }

  return (
    <ul className="org-role__names">
      {members.map((m, index) => {
        const vacant = !m.nameKo.trim() || m.nameKo.trim() === "공석";
        return (
          <li key={`${m.nameKo}-${m.nameEn}-${index}`}>
            <span className="org-role__name-ko">
              {vacant ? "공석" : m.nameKo}
            </span>
            {vacant || m.nameEn ? (
              <span className="org-role__name-en">
                {vacant ? "Vacant" : m.nameEn}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function RoleBlock({ role }: { role: OrgRole }) {
  return (
    <li className={role.highlight ? "org-role is-highlight" : "org-role"}>
      <span className="org-role__title">
        {role.roleKo}
        <small>{role.roleEn}</small>
      </span>
      <MemberNames members={role.members} />
    </li>
  );
}

type Props = {
  titleKo: string;
  titleEn: string;
  roles: OrgRole[];
};

export function OrgSection({ titleKo, titleEn, roles }: Props) {
  if (!roles.length) return null;
  return (
    <section className="org-section">
      <h3>
        {titleKo}
        <small>{titleEn}</small>
      </h3>
      <ul>
        {roles.map((role) => (
          <RoleBlock key={`${role.roleKo}-${role.roleEn}`} role={role} />
        ))}
      </ul>
    </section>
  );
}
