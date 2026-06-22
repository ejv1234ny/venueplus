"""GET /api/services/ must not 500 when a provider has null rating/availability/images
(the latent crash that hid the raw-SQL seeded Austin providers)."""
from sqlalchemy import text

from models import User, UserRole, ServiceProvider, ServiceCategory


def _provider(session, name):
    u = User(email=f"{name.lower()}@t.test", hashed_password="x", first_name=name,
             last_name="P", role=UserRole.SERVICE_PROVIDER, is_active=True, is_verified=False)
    session.add(u); session.commit(); session.refresh(u)
    sp = ServiceProvider(user_id=u.id, service_category=ServiceCategory.DJ,
                         service_name=name, description="d", hourly_rate=100.0,
                         minimum_hours=2, service_area_cities=["Austin"],
                         rating=4.8, availability={"mon": "9-5"}, images=["x.jpg"],
                         total_reviews=3, is_active=True)
    session.add(sp); session.commit(); session.refresh(sp)
    return sp


def test_services_list_tolerates_null_columns(client, session):
    seed = _provider(session, "NullDJ")
    _provider(session, "FullDJ")
    # Mimic the raw-SQL seed rows: NULL rating/availability/images that used to
    # raise ResponseValidationError -> HTTP 500 for the entire list.
    session.execute(text(
        "UPDATE service_providers SET rating=NULL, availability=NULL, images=NULL WHERE id=:id"),
        {"id": seed.id})
    session.commit()

    r = client.get("/api/services/?limit=50")
    assert r.status_code == 200, r.text          # was 500 before the schema fix
    by_name = {s["service_name"]: s for s in r.json()}
    assert {"NullDJ", "FullDJ"} <= set(by_name)
    assert by_name["NullDJ"]["rating"] is None
    assert by_name["NullDJ"]["availability"] is None
    assert by_name["FullDJ"]["rating"] == 4.8
