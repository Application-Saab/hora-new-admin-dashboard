
'use client';

import { useCallback, useEffect, useState } from 'react';
import './category-capsuele.css';
import { BASE_URL } from '../../../utils/apiconstant';

export default function CapsulesPage() {
    const [capsules, setCapsules] = useState([]);
    const [name, setName] = useState('');
    const [orderIds, setOrderIds] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const api = (path) => `${BASE_URL}${path}`;

    const loadCapsules = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(api('/api/internal/get-capsules'));
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to load capsules');
            }

            const list = Array.isArray(data)
                ? data
                : data.capsules || [];

            setCapsules(
                list.filter(
                    (item) =>
                        Array.isArray(item.galleryFolders) &&
                        item.galleryFolders.length > 0
                )
            );
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCapsules();
    }, [loadCapsules]);

    const resetForm = () => {
        setName('');
        setOrderIds('');
        setEditingId(null);
        setMessage('');
        setError('');
    };

    const startEdit = (capsule) => {
        setEditingId(capsule._id);
        setName(capsule.folderName || '');
        setOrderIds(
            (capsule.galleryFolders || [])
                .map((gallery) => gallery.orderId)
                .join('\n')
        );
        setMessage('');
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submitCapsule = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');

        const ids = [
            ...new Set(
                orderIds
                    .split(/[\n,]+/)
                    .map((id) => id.trim())
                    .filter(Boolean)
            ),
        ];

        if (!name.trim()) {
            setError('Please enter a capsule name.');
            return;
        }

        if (ids.length === 0) {
            setError('Please enter at least one Order ID.');
            return;
        }

        setSaving(true);

        try {
            const endpoint = editingId
                ? '/api/internal/edit-capsule'
                : '/api/internal/create-capsule';

            const payload = editingId
                ? { capsuleId: editingId, name: name.trim(), orderIds: ids }
                : { name: name.trim(), orderIds: ids };

            const response = await fetch(api(endpoint), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to save capsule');
            }

            setMessage(
                editingId
                    ? 'Capsule updated successfully.'
                    : 'Capsule created successfully.'
            );

            resetForm();
            await loadCapsules();
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="capsule-page">
            <header className="capsule-header">
                <div>
                    <h1>Category Capsule</h1>
                </div>
            </header>

            {message && <div className="capsule-alert success">{message}</div>}
            {error && <div className="capsule-alert error">{error}</div>}

            <section className="capsule-form-card">
                <div className="capsule-section-heading">
                    <div>
                        <h2>{editingId ? 'Edit Capsule' : 'Create New Capsule'}</h2>
                        <p>
                            {editingId
                                ? 'Update the capsule name or selected order galleries.'
                                : 'Enter a capsule name and at least one Order ID with an existing gallery.'}
                        </p>
                    </div>

                    {editingId && (
                        <button
                            type="button"
                            className="capsule-text-btn"
                            onClick={resetForm}
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                <form onSubmit={submitCapsule}>
                    <label htmlFor="capsule-name">Capsule Name</label>
                    <input
                        id="capsule-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="e.g. Sharma Wedding"
                        required
                    />

                    <label htmlFor="capsule-orders">
                        Order IDs <span className="capsule-required">*</span>
                    </label>

                    <textarea
                        id="capsule-orders"
                        value={orderIds}
                        onChange={(event) => setOrderIds(event.target.value)}
                        placeholder={'Enter one Order ID per line\nORDER_ID_1\nORDER_ID_2'}
                        rows={4}
                        required
                    />

                    <p className="capsule-help">
                        Enter multiple IDs separated by commas or new lines.
                        Each Order ID must have an existing gallery.
                    </p>

                    <button
                        className="capsule-btn capsule-btn-primary"
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? 'Please wait...'
                            : editingId
                                ? 'Save Changes'
                                : 'Create Capsule'}
                    </button>
                </form>
            </section>

            <section className="capsule-list-section">
                <div className="capsule-section-heading">
                    <div>
                        <h2>Existing Capsules</h2>
                        <p>{capsules.length} capsule(s) with galleries</p>
                    </div>
                </div>

                {loading && capsules.length === 0 ? (
                    <div className="capsule-empty">Loading capsules...</div>
                ) : capsules.length === 0 ? (
                    <div className="capsule-empty">
                        No capsules with available galleries were found.
                    </div>
                ) : (
                    <div className="capsule-table-wrapper">
                        <table className="capsule-table">
                            <thead>
                                <tr>
                                    <th>Capsule Name</th>
                                    <th>Order IDs</th>
                                    <th>Count</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {capsules.map((capsule) => (
                                    <tr key={capsule._id}>
                                        <td className="capsule-name-cell">
                                            {capsule.folderName}
                                        </td>

                                        <td className="capsule-orders-cell">
                                            {capsule.galleryFolders
                                                .map((gallery) => gallery.orderId)
                                                .join(', ')}
                                        </td>

                                        <td>
                                            <span className="capsule-count">
                                                {capsule.galleryFolders.length}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="capsule-btn capsule-btn-edit"
                                                onClick={() => startEdit(capsule)}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}
